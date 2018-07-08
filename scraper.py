from datetime import datetime
from bs4 import BeautifulSoup
import argparse
import requests
import json
import re

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

def parseComments(commentsUrl):
    commentTree = {}
    commentsPage = createSoup(commentsUrl)
    commentsDiv = commentsPage.find('div', {'class':'sitetable nestedlisting'})
    comments = commentsDiv.findAll('div', {'data-type':'comment'})
    for comment in comments:
        commentId = comment.find('p', {'class':'parent'}).find('a')['name']
        content = comment.find('div', {'class':'md'}).text.replace('\n','')[:80]
        parent = comment.find('a', {'data-event-action':'parent'})
        parentId = parent['href'][1:] if parent != None else '       '
        parentId = '       ' if parentId == commentId else parentId
        print(commentId, "reply-to:", parentId, content)
        commentTree[commentId] = {'reply-to':parentId, 'text':content}
    return commentTree

def processResults(results, product, startDate):
    lastDate = startDate
    for result in results:
        time = result.find('time')['datetime']
        date = datetime.strptime(time[:19], '%Y-%m-%dT%H:%M:%S')
        if date < startDate:
            print("older date encountered: ", str(date))
            return product, lastDate
        if date > lastDate:
            lastDate = date
        title = result.find('a', {'class':'search-title'}).text
        score = result.find('span', {'class':'search-score'}).text
        score = int(re.match(r'\d+', score).group(0))
        author = result.find('a', {'class':'author'}).text
        subreddit = result.find('a', {'class':'search-subreddit-link'}).text
        commentsTag = result.find('a', {'class':'search-comments'})
        url = commentsTag['href'] + '?sort=new'
        numComments = int(commentsTag.text.replace(' comments', ''))
        print("\n" + str(date)[:19] + ":", title, "\n", numComments, score, author, subreddit)
        commentTree = {} if numComments == 0 else parseComments(url)
        product.append({'title':title, 'url':url, 'date':str(date), 'score':score, 'author':author,
                        'subreddit':subreddit, 'comments':{'count':numComments, 'tree': commentTree}})
    print("\n\nDATE OF THE MOST RECENT POST:", lastDate)
    return product, lastDate

def writeProduct(product, timestamp):
    with open(args.keyword + ".json", 'w', encoding='utf-8') as f:
        json.dump({'timestamp':timestamp, 'product':product}, f, indent=4, ensure_ascii=False)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--keyword', type=str, default=DEFAULT_KEYWORD, help="keyword to search")
    args = parser.parse_args()

    try:
        data = json.load(open(args.keyword + ".json"))
        product = data['product']
        startDate = datetime.strptime(data['timestamp'][:19], '%Y-%m-%dT%H:%M:%S')
        print("newest post date:", startDate)
    except FileNotFoundError:
        print("WARNING: Database file not found. Creating a new one...")
        product = []
        startDate = TRESHOLD_DATE

    searchUrl = SITE_URL + 'search?q="' + args.keyword + '"&sort=new&t=year'
    print("Search URL:", searchUrl)
    results = getSearchResults(searchUrl)
    product, timestamp = processResults(results, product, startDate) 
    writeProduct(product, str(timestamp))
