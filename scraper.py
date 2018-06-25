from datetime import datetime
from bs4 import BeautifulSoup
import argparse
import requests
import json

SITE_URL = "https://old.reddit.com/"
DEFAULT_KEYWORD = "uzay"
REQUEST_AGENT = "Mozilla/5.0 Chrome/47.0.2526.106 Safari/537.36"
TRESHOLD_DATE = datetime(year=2017, month=1, day=1)

def createSoup(url):
    return BeautifulSoup(requests.get(url, headers={'User-Agent':REQUEST_AGENT}).text, 'lxml')

def getSearchResults(searchUrl):
    results = []
    while True:
        resultPage = createSoup(searchUrl)
        results += resultPage.findAll('div', {'class':'search-result-link'})
        footer = resultPage.findAll('a', {'rel':'nofollow next'})
        if footer:
            searchUrl = footer[-1]['href']
        else:
            return results

def processResults(results):
    product = {}
    for result in results:
        time = result.find('time')['datetime']
        date = datetime.strptime(time[:10], '%Y-%m-%d')
        if date < TRESHOLD_DATE:
            return
        title = result.find('a', {'class':'search-title'}).text
        comments = result.find('a', {'class':'search-comments'}).text
        score = result.find('span', {'class':'search-score'}).text
        author = result.find('a', {'class':'author'}).text
        subreddit = result.find('a', {'class':'search-subreddit-link'}).text
        key = result['data-fullname']
        value = {'title':title, 'comments':comments, 'score':score, 'author':author, 'subreddit':subreddit}
        product[key] = value
        print("\n" + str(date)[:10] + ":", title + "\n", key, comments, score, author, subreddit)
    return product

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--keyword', type=str, default=DEFAULT_KEYWORD, help="keyword to search")
    args = parser.parse_args()

    searchUrl = SITE_URL + 'search?q="' + args.keyword + '"&sort=new&t=year'
    print("Search URL:", searchUrl)
    results = getSearchResults(searchUrl)
    product = processResults(results) 
    outFileName = args.keyword + ".json"
    with open(outFileName, 'w') as f:
        json.dump(product, f)
