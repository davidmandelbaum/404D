# TO DO

# add ventilations
# 


# import the CSV file

setwd("C:/Users/Aaron/Dropbox/code")

setwd('404')

baxter = read.csv("baxter.csv")
angie = read.csv("angie.csv")

# Gather time and depth into two proper arrays (subtract if necessary) (data cleaning)
# Make sure the arrays are paired and whatnot

baxtest = head(baxter, n = 100)
angtest = head(angie, n = 100)


  # create local maxima function
  #
  # scratch that, we'll get maxes as we go along, 
  # can't get all data before creating score

# getmaxes <- function(user){ # finds local depth maxima
#   library(zoo)
#   x = data.frame(user$Depth)
#   max <- as.zoo(x)
#   maxlist <- rollapply(max, 3, function(x) which.max(x)==2)
#   head(maxlist, n = 30) # check your work
# }
# 
# getmins <- function(user){ # finds local depth minima
#   library(zoo)
#   x = data.frame(user$Depth)
#   min <- as.zoo(x)
#   minlist <- rollapply(min, 3, function(x) which.min(x)==2)
#   head(minlist, n = 30) # check your work
# }


# setscore function

# For each i, check i - 1. Is it a local max? If so, record it for scoring
# for each i, check i - 1. Is it a local min? If so, record it for scoring
# each new max manipulates score (deeper is better)
# each new min manipulates score (0 is best, anything else is worse)

# whenever we get a new max, check the time at that point. How long since the last one?
# ideal is 600 milliseconds, higher/lower is lost points

# score is a separate array



maxalg <- function(depth){
  depth = depth/10
  if (4 < depth & depth < 5){
    return(2.5)
  }
  if (depth > 5){
    return(1-(10*depth-5)) 
    # serious penalty for too-deep compression, you could break something
  }
  else{
    return(2.5-(2-(0.25*sqrt(depth)))) 
    # probably not penalizing very shallow compressions steeply enough
  }
}

minalg <- function(depth){
  depth = depth/10
  if (depth == 0){
    return(1)
  }
  else  
    return(1-depth) # score decreases linearly with partial recoil
}

timealg <- function(current, last){
  rate = (current - last)/100
  if (0.5 < rate && rate < 0.6){
    return(1)
  }
  if (0.3 < rate && rate < 0.8){
    return(1-(2*abs(0.55-rate)))
  }
  else
    return(0)
}


# capscore function

capscore <- function(user, start){
  
  allmax = NULL
  allmin = NULL
  allscore = NULL

  score = start # try 500 to start with

  time <- function(i){
    user[i,1]
  }
  
  depth <- function(i){
    user[i,2]
  }
  
for (i in 3:nrow(user)){
  score = (score - 0.9) # set this constant to whatever
  
  if(score > 500){
    riserate = 5   # recovery rate is faster when mmHg > 10
  }
  
  if(score <= 500){
    riserate = 3   # recovery rate is slower when mmHg < 10
  }
  
  if(depth(i-2) < depth(i-1) & depth(i) < depth(i-1)){
    allmax = rbind(allmax, c(depth(i-1), time(i-1)))
    score = score + riserate*(maxalg(depth(i-1)))    #assuming we're measuring in cm, easy change
                  + riserate*(timealg(tail(allmax, n=1),
                            head(tail(allmax, n=2), n=1))) 
  }
  
  if(depth(i-2) > depth(i-1) & depth(i) > depth(i-1)){
    allmin = rbind(allmin, c(depth(i-1), time(i-1)))
    score = score + (riserate*minalg(depth(i-1)))
  }
  
  if(score > 1250){  # whatever corresponds to a score of 25 mmHg or more
    score = 1250  # we could also drop the score a few points to allow "rewards" for continued good compressions
  }
  
  if(score < 250){  # Whatever corresponds to a score of 5 mmHg or less
    return("point of no return")
  }
  
  allscore <- c(allscore, score)
}
#   return(score)
#   return(tail(allscore, n = 100)
  plot(allscore)
  return(colMeans(allmax, dims = 1))
}
  #plot(score)
  #plot(depth, time)

# If score reaches certain minimum, output "dead"


