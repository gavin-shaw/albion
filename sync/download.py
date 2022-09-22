import os
import shutil
from bs4 import BeautifulSoup
import requests
import glob
import re
import time

os.chdir('/data')

headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600',
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'
}

url = "https://www.albion-online-data.com/database/"
req = requests.get(url, headers)
soup = BeautifulSoup(req.content, 'html.parser')
latest_zip = soup.select_one('a:last-of-type').get("href")
url = f"https://www.albion-online-data.com/database/{latest_zip}"

os.system(f'wget -c {url}')

shutil.unpack_archive(latest_zip, ".")

latest_sql = glob.glob("./*.sql")[0]

f = open(latest_sql, "r")
w = open(f"small.sql", "w")

regex = r"('2020-|'2021-|'2022-0[1234567])"

x = 0
while True:
    x+=1
    line = f.readline()
    
    if len(line) == 0:
        break;
    
    if "market_history" in line and len(re.findall(regex, line)):
        print(f'{x}: skip')
        continue
    
    print(f'{x}: write')
    w.write(line)

f = open(f"small.sql", "r")

x=0
while True:
    x+=1
    line = f.readline()
    
    if len(line) == 0:
        break;
    
    if ("market_order" in line):
        print(f'{x}: market_order')

    if ("market_history" in line):
        print(f'{x}: market_history')
    
os.system(f'mysql --user=root albion < small.sql')

print('sleeping for a minute')
time.sleep(60)
