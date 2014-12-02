# TO DO

# How important is recoil, relative to depth?
  # importance should be roughly equivalent, missing X depth = missing X recoil
  # Look for outcome studies based on people leaning during CPR



# Fix timealg, which is not actually activating anymore
# I don't think it was ever activating


# Slow down the rate of decline, try to keep things realistic

# state in correct units
# BB values in cm and seconds, so build for that



# Make all the rates much higher? These tiny time intervals
# are doing something strange to david zero, I think



setwd("C:/Users/Aaron/Dropbox/code")

setwd('404/csv')


# Import and assign variables to all CSVs 

file_list = list.files()

for (i in 1:length(file_list)){  
  assign(strsplit(file_list[i],".csv")[[1]],
         read.csv(file_list[i]))
}

# READ THE CSVs INDIVIDUALLY (no longer necessary)
# 
# fast = read.csv("fast.csv")
# slow = read.csv("slow.csv")
# shallow = read.csv("shallow.csv")
# deep = read.csv("deep.csv")


# SMOOTH OUT DATASETS WITH DIFFERENT POINTS OF REFERENCE

depth_intent = 40 # average depth you'd like to smooth for

smooth <- function(data){
  sdepth <- data[2]*depth_intent/colMeans(data[2])
  data <- data.frame(data[1],sdepth)
}

# SHRINK DATASETS FOR TESTING

test <- function(data){
  data <- head(data, n = 100) 
}

# CLEAN OUTLIERS FROM THE DATASET 

# note: this will not work on Laerdal data unless it is divided by 10

toodeep = 7
tooshallow = 0

clean <- function(data){
  time <- data[1]
  depth <- data[2]
  time <- time[depth > tooshallow & depth < toodeep]
  depth <- depth[depth > tooshallow & depth < toodeep]
  data <- data.frame(time, depth) 
}


# SWITCH TWO COLUMNS IF NEED BE

swap <- function(user){
  user = data.frame(user[2],user[1])
}


# GET RID OF NEGATIVE DEPTH

# first, check if data frame contains negative number

# if so, add 1 to all numbers, then repeat
# turn those numbers into zero?
# if most of the number s are negative, multiply everything by -1



# FUNCTION TO FIND MINS AND MAXES

minmax <- function(user){
  
  #   user = clean(user) # Watch out for this andthe below
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
ratescore = 1 # never activating now

goodrates = c(100, 120)
badrates = c(60, 160)

slowpunish = -1 # how much we punish each slow compression
fastpunish = -1 # how much we punish each fast compression

maxscore = 1250 # whatever corresponds to 25 mmHg
deathscore = 250 # whatever corresponds to 5 mmHg
neardeath = deathscore + ((maxscore-deathscore)/4)

fallrate = 20

goodrise = 5.0
badrise = 3.0   # Should still allow for rescue below 10 mmHg w/perfect CPR


# FUNCTIONS DETERMINING RISE/FALL RATES

maxalg <- function(depth){
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
  
  if (depth == 0){
    return(recoilscore)
  }
  else  
    return(recoilscore-depth) # score decreases linearly with partial recoil
}

timealg <- function(current,last){
  
  if (current == last){
    last = 1
  }
  
  rate = 60/(current - last) 
  
  return(120-(abs(110-rate)))/50
}

#   IF FUNCTIONS BELOW NOT WORKING
#   if (min(goodrates) < rate && rate < max(goodrates)){
#     return(ratescore)
#   }
#   if (min(badrates) < rate && rate < max(badrates)){
#     return(ratescore-(abs(mean(badrates)-rate))/30) 
#   }
#   
#   # redundancy in the code below may seem bizarre, 
#   # but it's the only way I could get rid of all error warnings
#   
#   if (max(badrates) < rate && rate > max(badrates)){
#     return(slowpunish)
#   }
#   if (min(badrates) > rate && rate < min(badrates)){
#     return(fastpunish)
#   }
#   else return(0)



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
  
  # insert pause-punishing algorithm here 
  # probably better just to have a steep fallrate and high compression bonuses
  # that should incentivize not pausing pretty well
  
  if(depth(i-2) < depth(i-1) & depth(i) < depth(i-1)){
    print(score)
    allmax = rbind(allmax, c(depth(i-1),time(i-1))) # if max, store time + depth (for time reference)
    print(allmax)
    score = print(score + riserate*(maxalg(depth(i-1)))
                  + riserate*((timealg(tail(allmax, n=1),
                            head(tail(allmax, n=2), n=1)))[2]))
    
    print(score + riserate*(maxalg(depth(i-1)))
    + riserate*((timealg(tail(allmax, n=1),
                         head(tail(allmax, n=2), n=1)))[2]))
    
    print(score)
    
    # timealg now returning a list of two numbers, the first of which makes no sense
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
  