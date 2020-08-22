#Requirements

library(ggplot2)
library(dplyr)

#Setting Directory

setwd("C:/Users/daily/Desktop/nfl-project3")

#Importing draft data

draft_data <- read.csv(file = "Draft_Data.csv")

#Filtering data to only first rounders and completed rookie contracts

First_Rounders = filter(draft_data, Rnd == 1 & Year < 2017)

#Replacing positions to more generic ones for density charts

First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "C", "OL"))
First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "CB", "DB"))
First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "DE", "DL"))
First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "DT", "DL"))
First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "G", "OL"))
First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "ILB", "LB"))
First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "NT", "DL"))
First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "OLB", "LB"))
First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "OT", "OL"))
First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "S", "DB"))
First_Rounders <- First_Rounders %>% mutate(Pos = replace(Pos, Pos == "T", "OL"))

#Splitting the data into offense and defense

Offense_First_Rounders = filter(First_Rounders, Pos == "OL" | Pos == "QB" | Pos == "RB" | Pos == "TE" | Pos == "WR")
Defense_First_Rounders = filter(First_Rounders, Pos == "DB" | Pos == "DL" | Pos == "LB")

#Creating an density chart for offense

ggplot(data = Offense_First_Rounders, aes(x = RookieAV, fill = Pos)) +
geom_density(alpha = .5) +
ggtitle("Offensive Approximate Values \n During Rookie Contract") +
theme(plot.title = element_text(hjust = 0.5))

#Creating an density chart for defense

ggplot(data = Defense_First_Rounders, aes(x = RookieAV, fill = Pos)) +
geom_density(alpha = .5) +
ggtitle("Defensive Approximate Values \n During Rookie Contract") +
theme(plot.title = element_text(hjust = 0.5))
