# TO DO

# How important is recoil, relative to depth?

# continue tweaking algorithm numbers
# add ventilations

# Add functionality for "switching off" between users?

# Slow down the rate of decline, try to keep things realistic

# divide everything by 50?


# Make all the rates much higher? These tiny time intervals
# are doing something strange to david zero, I think




# DEBUGGING, 11/30

# subscript out of bounds = never generating a max?
# Nope, turns out I'd just done something funky to the files and not refreshed,
# because the refresh function doesn't save variables OUTSIDE the function (of course)




# IMPORT THE CSV FILES

setwd("C:/Users/Aaron/Dropbox/code")

setwd('404/csv')

library(zoo)

data_list <- list.files()

  baxter = read.csv("baxter.csv")
  angie = read.csv("angie.csv")
  charlie = read.csv("charlie.csv")
  chocolate = read.csv("chocolate.csv")
  david = read.csv("david.csv")
  david2 = read.csv("david2.csv")
  david3 = read.csv("david3.csv")
  david4 = read.csv("david4.csv")
  daniel = read.csv("daniel.csv")
  farfell = read.csv("farfell.csv")



# SMOOTH OUT DATASETS WITH DIFFERENT POINTS OF REFERENCE

smooth <- function(data){
  sdepth <- data[2]*25/colMeans(data[2])
  data <- data.frame(data[1],sdepth)
#   return(data[2]*25/colMeans(data[2]))
}

# SHRINK DATASETS FOR TESTING

test <- function(data){
  data <- head(data, n = 100) 
}

# CLEAN OUTLIERS FROM THE DATASET

clean <- function(data){
  time <- data[1]
  depth <- data[2]
  depth <- depth[ depth > 0 & depth < 80]
  time <- head(time, n = length(depth))
  data <- data.frame(time, depth) 
#   data <- as.matrix(data.frame(time,depth))
}


# SWITCH TWO COLUMNS IF NEED BE

swap <- function(user){
  user = data.frame(user[2],user[1])
}


# GET RID OF NEGATIVE DEPTH

# first, check if data frame contains negative number

# if so, add 1 to all numbers, then repeat



# FUNCTION TO FIND MINS AND MAXES

minmax <- function(user){
  
  #   user = clean(user) # Watch out for this one
  #   user = smooth(user)
  allmax = NULL
  allmin = NULL
  time <- function(i){user[i,1] }
  depth <- function(i){ user[i,2]}
  
  for (i in 3:nrow(user)){    
    if(depth(i-2) < depth(i-1) & depth(i) < depth(i-1)){
      allmax = rbind(allmax, c(depth(i-1),time(i-1))) # if max, store time + depth
    }
    if(depth(i-2) > depth(i-1) & depth(i) > depth(i-1)){
      allmin = rbind(allmin, c(depth(i-1),time(i-1))) # if min, store time + depth
    }
  }  
  
  return(c(colMeans(allmin)[1],colMeans(allmax)[1]))
}

# SET SCORE VARIABLES

mindepth = 4.7
maxdepth = 6.2

depthscore = 2.5
recoilscore = 1.2

maxscore = 1250 # whatever corresponds to 25 mmHg
deathscore = 250 # whatever corresponds to 5 mmHg
neardeath = deathscore + ((maxscore-deathscore)/4)

fallrate = 10

goodrise = 5.0
badrise = 3.0   # Should still allow for rescue below 10 mmHg w/perfect CPR

# FUNCTIONS DETERMINING RISE/FALL RATES

maxalg <- function(depth){
  depth = depth/10
  if (mindepth < depth & depth < maxdepth){
    return(depthscore)
  }
  if (depth > maxdepth){
    return(depthscore-(10*(depth-maxdepth))) 
    # serious penalty for too-deep compression, you could break something
    
    # limit penalty in case of random spikes
    
  }
  else{
    return(depthscore-(sqrt(mindepth)-(0.25*sqrt(depth)))) 
    # probably not penalizing very shallow compressions steeply enough
  }
}

minalg <- function(depth){
  
  depth = depth/10
  
  if (depth == 0){
    return(recoilscore)
  }
  else  
    return(recoilscore-depth) # score decreases linearly with partial recoil
}

timealg <- function(current, last){
  
  rate = (current - last)*2
  ratescore = 1
  
  goodrates = c(100, 120)
  weakrates = c(60, 160)
  
  
  if (min(goodrates) < rate && rate < max(goodrates)){
    return(ratescore)
  }
  if (min(weakrates) < rate && rate < max(weakrates)){
    return(ratescore-(2*abs(mean(weakrates)-rate)))
  }
  else
    return(0)
}

# cAPSCORE FUNCTION

capscore <- function(user, start){
  
#   user = smooth(user)
#   user = clean(user)
  
  allscore = NULL
  allmax = NULL
  allmin = NULL
  
  score = start # try 20 mmHg to start with

  time <- function(i){user[i,1]}
  depth <- function(i){user[i,2]}
  
  scorefall <- function(x,y){fallrate*(time(x)-time(y))} # account for time gaps 
  
  
  # LOOP THROUGH AND UPDATE SCORE
  
for (i in 3:nrow(user)){
  score = score - scorefall(i,i-1)
  
  if(score > neardeath){riserate = goodrise} # recovery rate is faster when mmHg > 10
  
  if(score <= neardeath){riserate = badrise} # recovery rate is slower when mmHg < 10
  
  if(depth(i-2) < depth(i-1) & depth(i) < depth(i-1)){
    allmax = rbind(allmax, c(depth(i-1),time(i-1))) # if max, store time + depth (for time reference)
    score = score + riserate*(maxalg(depth(i-1)))
                  + riserate*(timealg(tail(allmax, n=1),
                            head(tail(allmax, n=2), n=1))) 
  }
  
  if(depth(i-2) > depth(i-1) & depth(i) > depth(i-1)){
    score = score + (riserate*minalg(depth(i-1)))
  }
  
#   if(score > maxscore){  # whatever corresponds to a score of 25 mmHg or more
#     score = maxscore  # we could also drop the score a few points to allow "rewards" for continued good compressions
#   }
  
  if(score < deathscore){  # Whatever corresponds to a score of 5 mmHg or less
    return("point of no return")
  }
  
  allscore <- c(allscore, score)
}
    return(allscore)
}


# PLOT ALL AVAILABLE DATA

# plot(capscore(read.csv(data_list[1])))
# 
# for (i in 2:length(data_list)){
#   lines(capscore(read.csv(data_list[i])))
# }

# PLOT SPECIFIC DATASETS

#   plot(capscore(daniel, 500000))
#   lines(capscore(baxter, 500000), col="blue")
#   lines(capscore(angie, 500000), col="red")
# 
#   plot(capscore(david, 1000))
#   lines(capscore(david2, 1000), col="blue")
  