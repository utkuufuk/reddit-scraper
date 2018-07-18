'use strict';

$(function() {
    var $posts = $('#posts');
    var $keywords = $('#keywords');

    function addPost(post) {
        $posts.append('<li><strong>Title:</strong> ' + post.title + '<br>' +
                      '<strong>Author:</strong> ' + post.author + '<br>' +
                      '<strong>Score:</strong> ' + post.score + '<br>' +
                      '<strong>Date:</strong> ' + post.date + '<br>' +
                      '<strong>Subreddit:</strong> ' + post.subreddit + '<br>' +
                      '<strong>URL:</strong> ' + post.url + '<br>' +
                      '<button data-id=' + post.id + ' class="expand">Show Comments</button></li>');
    }

    function addKeyword(keyword, product) {
        $keywords.append('<br><strong>' + keyword + '</strong><br>');
        $keywords.append('<li><strong>Last Crawl Date:</strong>' + product[keyword]['timestamp'] + '</li>');
        $keywords.append('<li><strong>Subreddit: </strong> r/' + product[keyword]['subreddit'] + '</li>');
    }

    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/db/',
        success: function(product) {
            $.each(Object.keys(product), function(i, keyword) {
                addKeyword(keyword, product);
            });
        },
        error: function() {
            alert('error loading keywords');
        }
    });
});
