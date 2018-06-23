from datetime import datetime
from bs4 import BeautifulSoup
import argparse
import requests

SITE_URL = "https://old.reddit.com/"
DEFAULT_KEYWORD = "tübitak"
REQUEST_AGENT = "Mozilla/5.0 Chrome/47.0.2526.106 Safari/537.36"
TRESHOLD_DATE = datetime(year=2017, month=1, day=1)

def createSoup(url):
    return BeautifulSoup(requests.get(url, headers={'User-Agent':REQUEST_AGENT}).text, 'lxml')

def getSearchResults(searchUrl):
    searchResults = []
    while True:
        resultPage = createSoup(searchUrl)
        results = resultPage.findAll('div', {'class':'search-result-link'})
        searchResults += results
        footers = resultPage.findAll('a', {'rel':'nofollow next'})
        if footers:
            searchUrl = footers[-1]['href']
        else:
            return searchResults

def processResults(results):
    for result in results:
        time = result.find('time')['datetime']
        date = datetime.strptime(time[:10], '%Y-%m-%d')
        if date < TRESHOLD_DATE:
            return
        title = result.find('a', {'class':'search-title'})
        print(str(date)[:10] + ":", title.text)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--keyword', type=str, default=DEFAULT_KEYWORD, help="keyword to search")
    args = parser.parse_args()
    searchUrl = SITE_URL + 'search?q="' + args.keyword + '"&sort=new'

    results = getSearchResults(searchUrl)
    processResults(results) 
