# reddit-scraper
A tool for scraping and visualizing search results from [Reddit](https://www.reddit.com).

## Setting Up
### Installing Node.js
[Json-Server](https://github.com/typicode/json-server) is utilized as the back-end for visualizing the scraped data, and [Node.js](https://nodejs.org/en/) is required in order to use it.
The following bash commands can be used to install [Node.js](https://nodejs.org/en/) in Debian-based architectures.
For other architectures, please refer to the [official installation guide](https://nodejs.org/en/download/package-manager/).
``` sh
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Setting up Json-Server
Inside the [jsonserver](https://github.com/utkuufuk/reddit-scraper/tree/master/jsonserver) directory, run the following bash command without modifying the existing files:
``` sh
npm install --save json-server
```

### Installing Beautiful Soup 4
[Beautiful Soup 4](https://www.crummy.com/software/BeautifulSoup/bs4/doc/#) is used for parsing the HTML data of [Reddit](https://www.reddit.com). So it has to be installed along with the `requests` package for Python 3 in order to use the scraper.
``` sh
pip3 install requests beautifulsoup4
```

## Usage
This tool is made up of two parts; a web scraper and a dynamic web page for visualizing the results.
The scraped data is stored in a file called `product.json`, and it is served by [Json-Server](https://github.com/typicode/json-server) to the front-end for visualization.

### Scraping
You can make scraper limit its search by a specific subreddit, or you can make it search all subreddits.

#### Searching for a Keyword in All Subreddits
For example, in order to search for the keyword **uzay** in all subreddits, run the command below inside the root project folder:
``` sh
python3 scraper.py --keyword="uzay"
```

#### Searching for a Keyword in All Subreddits
In order to search for the keyword **ayn rand** in the subreddit **r/objectivism**, run the command below inside the root project folder:
``` sh
python3 scraper.py --keyword="ayn rand" --subreddit="objectivism"
```

#### Incremental Search
If there is an existing `product.json` file, the scraper will append the search results of a new keyword at the end of the file.

If the keyword already exists in `product.json`, the scraper will start searching from the date of the most recent post and append the new content at the end of the existing posts that had been earlier saved for that keyword.

### Visualization
When the `product.json` file is ready for visualization, run the following command inside the [jsonserver](https://github.com/utkuufuk/reddit-scraper/tree/master/jsonserver) directory in order to start the [Json-Server](https://github.com/typicode/json-server):
``` sh
npm run json:server
```

Then, open up the [reddit.html](https://github.com/utkuufuk/reddit-scraper/blob/master/reddit.html) file inside a browser.
