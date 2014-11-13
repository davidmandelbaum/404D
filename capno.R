
# Factor out the ability to grab tables fill of maxes/mins





# TO DO

# continue tweaking algorithm numbers
# add ventilations
# Search for influence of airflow on ETCO2, translate rate/depth into airflow and then airflow into ETCO2?
# Search for more papers to set better parameters

# what should the max depth be? The min?

# divide everything by 50?


# IMPORT THE CSV FILE

setwd("C:/Users/Aaron/Dropbox/code")

setwd('404')

baxter = read.csv("baxter.csv")
angie = read.csv("angie.csv")
charlie = read.csv("charlie.csv")
chocolate = read.csv("chocolate.csv")
daniel = read.csv("daniel.csv")
farfell = read.csv("farfell.csv")


# CLEAN THE DATASET

test <- function(data){
  data <- head(data, n = 100) 
}


clean <- function(data){
  time <- data[1]
  depth <- data[2]
  depth <- depth[ depth > 0 & depth < 80]
  time <- head(time, n = length(depth))
  data <- data.frame(time, depth) 
}


# SET VARIABLES FOR CANOGRAPHY SCORING

mindepth = 4.0
maxdepth = 5.5

depthscore = 2.5


maxalg <- function(depth){
  depth = depth/10
  if (mindepth < depth & depth < maxdepth){
    return(depthscore)
  }
  if (depth > maxdepth){
    return(depthscore-(10*(depth-maxdepth))) 
    # serious penalty for too-deep compression, you could break something
  }
  else{
    return(depthscore-(sqrt(mindepth)-(0.25*sqrt(depth)))) 
    # probably not penalizing very shallow compressions steeply enough
  }
}

minalg <- function(depth){
  
  depth = depth/10
  recoilscore = 1
  
  if (depth == 0){
    return(recoilscore)
  }
  else  
    return(recoilscore-depth) # score decreases linearly with partial recoil
}

timealg <- function(current, last){
  
  rate = (current - last)/100
  ratescore = 1
  
  goodrates = c(0.5, 0.6)
  weakrates = c(0.3, 0.8)
  
  
  if (min(goodrates) < rate && rate < max(goodrates)){
    return(ratescore)
  }
  if (min(weakrates) < rate && rate < max(weakrates)){
    return(ratescore-(2*abs(mean(weakrates)-rate)))
  }
  else
    return(0)
}


# capscore function

capscore <- function(user, start){
  
  user = clean(user)
  
  allmax = NULL
  allmin = NULL
  allscore = NULL

  score = start # try 20 mmHg to start with

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
  
#   if(score > 1250){  # whatever corresponds to a score of 25 mmHg or more
#     score = 1250  # we could also drop the score a few points to allow "rewards" for continued good compressions
#   }
  
  if(score < 250){  # Whatever corresponds to a score of 5 mmHg or less
    return("point of no return")
  }
  
  allscore <- c(allscore, score)
}
    return(allscore)
    print(colMeans(allmax, dims = 1))
}

  plot(capscore(daniel, 3000))
  lines(capscore(baxter, 3000), col="blue")
  lines(capscore(angie, 3000), col="red")
