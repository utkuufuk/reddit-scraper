from datetime import datetime
from bs4 import BeautifulSoup
import argparse
import requests
import json
import re

SITE_URL = 'https://old.reddit.com/'
DEFAULT_KEYWORD = "jojo mayer"
DEFAULT_SUBREDDIT = None
REQUEST_AGENT = 'Mozilla/5.0 Chrome/47.0.2526.106 Safari/537.36'
TRESHOLD_DATE = datetime(year=2017, month=7, day=1)

def createSoup(url):
    return BeautifulSoup(requests.get(url, headers={'User-Agent':REQUEST_AGENT}).text, 'lxml')

def getSearchResults(searchUrl):
    posts = []
    while True:
        resultPage = createSoup(searchUrl)
        posts += resultPage.findAll('div', {'class':'search-result-link'})
        footer = resultPage.findAll('a', {'rel':'nofollow next'})
        if footer:
            searchUrl = footer[-1]['href']
        else:
            return posts

def parseComments(commentsUrl):
    commentTree = {}
    commentsPage = createSoup(commentsUrl)
    commentsDiv = commentsPage.find('div', {'class':'sitetable nestedlisting'})
    comments = commentsDiv.findAll('div', {'data-type':'comment'})
    for comment in comments:
        numReplies = int(comment['data-replies'])
        tagline = comment.find('p', {'class':'tagline'})
        author = tagline.find('a', {'class':'author'})
        author = "[deleted]" if author == None else author.text
        date = tagline.find('time')['datetime']
        date = datetime.strptime(date[:19], '%Y-%m-%dT%H:%M:%S')
        commentId = comment.find('p', {'class':'parent'}).find('a')['name']
        content = comment.find('div', {'class':'md'}).text.replace('\n','')
        score = comment.find('span', {'class':'score unvoted'})
        score = 0 if score == None else int(re.match(r'[+-]?\d+', score.text).group(0))
        parent = comment.find('a', {'data-event-action':'parent'})
        parentId = parent['href'][1:] if parent != None else '       '
        parentId = '       ' if parentId == commentId else parentId
        print(commentId, 'date:', date, 'reply-to:', parentId, 'num-replies:', numReplies, content[:63])
        commentTree[commentId] = {'author':author, 'reply-to':parentId, 'text':content,
                                  'score':score, 'num-replies':numReplies, 'date':str(date)}
    return commentTree

def processPosts(posts, product, startDate, keyword):
    if keyword not in product:
        product[keyword] = {}
        product[keyword]['posts'] = []
    lastDate = startDate
    for post in posts:
        time = post.find('time')['datetime']
        date = datetime.strptime(time[:19], '%Y-%m-%dT%H:%M:%S')
        if date < startDate:
            print('older date encountered: ', str(date))
            product[keyword]['timestamp'] = str(lastDate)
            return product
        if date > lastDate:
            lastDate = date
        title = post.find('a', {'class':'search-title'}).text
        score = post.find('span', {'class':'search-score'}).text
        score = int(re.match(r'[+-]?\d+', score).group(0))
        author = post.find('a', {'class':'author'}).text
        subreddit = post.find('a', {'class':'search-subreddit-link'}).text
        commentsTag = post.find('a', {'class':'search-comments'})
        url = commentsTag['href'] + '?sort=new'
        numComments = int(re.match(r'\d+', commentsTag.text).group(0))
        print("\n" + str(date)[:19] + ":", numComments, score, author, subreddit, title)
        commentTree = {} if numComments == 0 else parseComments(url)
        product[keyword]['posts'].append({'title':title, 'url':url, 'date':str(date), 'score':score,
                                          'author':author, 'subreddit':subreddit, 'comments':commentTree})
    print('\n\nDATE OF THE MOST RECENT POST:', lastDate)
    product[keyword]['timestamp'] = str(lastDate)
    return product

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--keyword', type=str, default=DEFAULT_KEYWORD, help='keyword to search')
    parser.add_argument('--subreddit', type=str, default=DEFAULT_SUBREDDIT, help='subreddit to search')
    args = parser.parse_args()
    if args.subreddit == None:
        searchUrl = SITE_URL + 'search?q="' + args.keyword + '"&sort=new&t=year'
    else:
        searchUrl = SITE_URL + 'r/' + args.subreddit + '/search?q="' + args.keyword + '"&restrict_sr=on&sort=new&t=year'
    print('Search URL:', searchUrl)
    try:
        product = json.load(open('product.json'))
        startDate = datetime.strptime(product[args.keyword]['timestamp'][:19], '%Y-%m-%d %H:%M:%S')
        print('newest post date:', startDate)
    except FileNotFoundError:
        print('WARNING: Database file not found. Creating a new one...')
        product = {}
        startDate = TRESHOLD_DATE
    except KeyError:
        print('WARNING: Keyword not found in database. Initializing...')
        startDate = TRESHOLD_DATE
    posts = getSearchResults(searchUrl)
    product = processPosts(posts, product, startDate, args.keyword.replace(' ', '-')) 
    product[args.keyword.replace(' ', '-')]['subreddit'] = 'all' if args.subreddit == None else args.subreddit
    with open('product.json', 'w', encoding='utf-8') as f:
        json.dump(product, f, indent=4, ensure_ascii=False)
