library("memisc", lib.loc="C:/Users/Aaron/Documents/R/win-library/3.0")

setwd("C:/Users/Aaron/Dropbox/code/404")

# data <- as.data.set(spss.system.file('string30.sav'))

data <- read.csv("string30.csv")

# data <- head(data, n=1)

# matrix <- as.matrix(data)


data <- data[complete.cases(data),]
# data <- data[complete.cases(data[,250:500]),]
# cuts all rows with any NAs in the columns between 250 and 500


extractrow <- function(data, x){
  
  myrow = numeric(length(length(data)))
  
  for (i in 1:length(data)){
#       myrow[i] <- data[x,i]
        myrow[i] <- data[x,i]
    }
  return(myrow[1:10])
}

row1 <- extractrow(data, 1)
row2 <- extractrow(data, 2)
row3 <- extractrow(data, 3)

# Next step: look for patterns in the rows you now have

# https://stackoverflow.com/questions/5237557/extracting-every-nth-element-of-a-vector





# Write CSV in R
write.csv(data, file = "string30.csv",row.names=FALSE)





# strings <- c("foo", 14)
# 
# suppressWarnings(!is.na(as.numeric(strings)))