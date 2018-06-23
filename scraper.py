from datetime import datetime
from bs4 import BeautifulSoup
import argparse
import requests

SITE_URL = "https://old.reddit.com/"
DEFAULT_KEYWORD = "jpeg%202000"
REQUEST_AGENT = "Mozilla/5.0 Chrome/47.0.2526.106 Safari/537.36"

def createSoup(url):
    return BeautifulSoup(requests.get(url, headers={'User-Agent':REQUEST_AGENT}).text, 'lxml')

def getNextPageUrl(resultPageUrl):
    resultPage = createSoup(resultPageUrl)
    footers = resultPage.findAll('a', {'rel':'nofollow next'})
    return footers[-1]['href']

if __name__ == '__main__':
    # build the search URL using the input keyword
    parser = argparse.ArgumentParser()
    parser.add_argument('--keyword', type=str, default=DEFAULT_KEYWORD, help="search keyword")
    args = parser.parse_args()
    searchUrl = SITE_URL + 'search?q="' + args.keyword + '"'

    while True:
        print("searching", searchUrl)
        resultPage = createSoup(searchUrl)
        results = resultPage.findAll('div', {'class':'search-result-link'})
        for result in results:
            print(result.text)
            time = result.find('time')
            print(time['datetime'])
            date = datetime.strptime(time['datetime'][:10], '%Y-%m-%d')
            print(date)
            input()
        searchUrl = getNextPageUrl(searchUrl)
