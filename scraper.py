from bs4 import BeautifulSoup
import argparse
import requests

SITE_URL = "https://old.reddit.com/"
DEFAULT_KEYWORD = "jpeg%202000"
AGENT = "Mozilla/5.0 Chrome/47.0.2526.106 Safari/537.36"
LANGUAGE = 'en-US,en;q=0.8'

def createSoup(url):
    return BeautifulSoup(requests.get(url, headers={'User-Agent':AGENT, 'Accept-Language':LANGUAGE}).text, 'lxml')

def getNextResultPageUrl(resultPageUrl):
    page = createSoup(resultPageUrl)
    footer = page.findAll('span', {'class':'nextprev'})[-1] 
    return footer.findAll('a')[-1]['href']

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--keyword', type=str, default=DEFAULT_KEYWORD, help="search keyword")
    args = parser.parse_args()
    searchUrl = SITE_URL + 'search?q="' + args.keyword + '"'

    page = createSoup(searchUrl)
    contents = page.findAll('div', {'class':'search-result-link'})

    for content in contents:
        print(content.text)
        input() 

    nextPageUrl = getNextResultPageUrl(searchUrl)
    print(nextPageUrl)

    nextPageUrl = getNextResultPageUrl(nextPageUrl)
    print(nextPageUrl)
