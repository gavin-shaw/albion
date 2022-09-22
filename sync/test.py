import os

os.chdir('./data')

f = open(f"small.sql", "r")

x = 0
while True:
    x+=1
    line = f.readline()

    if len(line) == 0:
        break;
    
    if ("market_order" in line):
        print(line, end='')