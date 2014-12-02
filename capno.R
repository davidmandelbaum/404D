# TO DO
# slow down the rate of decline

# why does changing fastpunish change the fate of slow? In a massive way?

# some kind of interaction between rate and depth? To make things not look so herky-jerky?


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
# fast = read.csv("fast.csv"), etc.


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
  
  maxnum = length(allmax)/2
  minutes = time(i)/60
  rate = maxnum/minutes
  
  return(c(colMeans(allmin)[1],colMeans(allmax)[1],rate))
}


# SET SCORE VARIABLES

mindepth = 4.7
maxdepth = 6.2

speed_ceiling = 140 # above this, rate is very poor
speed_floor = 80 # below this, rate is very poor

depthscore = 10
recoilscore = depthscore
ratescore = 2

goodrates = c(100, 120)
badrates = c(60, 160)

slowpunish = 12 # how much we punish each slow compression
  # the ratio of this to fastpunish has to be high, since fast users take so many more hits
fastpunish = 3 # how much we punish each fast compression
depth_penalty = 1 # how much we punish for overly deep compressions
shallow_penalty = 10 # how much we punish for overly shallow compressions

maxscore = 1250 # whatever corresponds to 25 mmHg
deathscore = 250 # whatever corresponds to 5 mmHg
neardeath = deathscore + ((maxscore-deathscore)/4) # 80% of the way to death

fallrate = 10

goodrise = 2
badrise = 0.6*goodrise   # Should still allow for rescue below 10 mmHg w/perfect CPR


# TEST PLOTS

start = 100
plot(capscore(deep,start))
lines(capscore(shallow,start),col="blue")
lines(capscore(slow,start),col="red")
lines(capscore(fast,start),col="green")



# FUNCTIONS DETERMINING RISE/FALL RATES

maxalg <- function(depth){
  if (mindepth < depth & depth < maxdepth){ # this works even though similar time function doesn't
    return(depthscore)
  }
  if (depth > maxdepth){
    return(depthscore-(depth_penalty*(depth-maxdepth))) 
  }
  else return(depthscore-(shallow_penalty*(mindepth-depth)))
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
    last = 1 # prevents first rate from reading as "infinity"
  }
  
  rate = 60/(current-last) 
  
  toofast = 0
  tooslow = 0
  
  if(rate>speed_ceiling){toofast = 1}
  if(rate<speed_floor){tooslow = 1}
  
#   x = c(toofast,tooslow)
#   print(x)
  
  return(ratescore*((((120-(2*(abs(110-rate))))/100)^5) # punish larger deviations more through exponent
                    -(toofast*fastpunish)
                    -(tooslow*slowpunish)))
}


# cAPSCORE FUNCTION

capscore <- function(user, start){
  
#   user = smooth(user)
#   user = clean(user)
  
  allscore = NULL
  allmax = NULL
  allmin = NULL
  
  score = start*50 # presumed starting score of 1000

  time <- function(i){user[i,1]}
  depth <- function(i){user[i,2]}
  
  scorefall <- function(x,y){fallrate*(time(x)-time(y))} # account for time gaps 
  
  
  # LOOP THROUGH AND UPDATE SCORE
  
for (i in 15:nrow(user)){
  score = score - scorefall(i,i-1)
  
  if(score > neardeath){riserate = goodrise} # recovery rate is faster when mmHg > 10
  
  if(score <= neardeath){riserate = badrise} # recovery rate is slower when mmHg < 10
  
  if(depth(i-2) < depth(i-1) & depth(i) < depth(i-1)){
    allmax = rbind(allmax, c(depth(i-1),time(i-1))) # if max, store time + depth (for time reference)
    score = print(score + riserate*(maxalg(depth(i-1)))
                  + riserate*((timealg(tail(allmax, n=1),
                            head(tail(allmax, n=2), n=1)))[2]))
    # for some reason, just adding the score doesn't work, but adding print(score) does
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
    return(allscore/50)
}


# PLOT ALL AVAILABLE DATA

# plot(capscore(read.csv(data_list[1])))
# 
# for (i in 2:length(data_list)){
#   lines(capscore(read.csv(data_list[i])))
# }
  