'use strict';

$(function() {
    // cache some HTML elements
    var $posts = $('#posts');
    var $keywords = $('#keywords');

    // creates an order <li> in the HTML document
    function addPost(post) {
        $posts.append('<li><strong>Title:</strong> ' + post.title + '<br>' +
                       '<strong>Author:</strong> ' + post.author + '<br>' +
                       '<strong>Score:</strong> ' + post.score + '<br>' +
                       '<strong>Date:</strong> ' + post.date + '<br>' +
                       '<strong>Subreddit:</strong> ' + post.subreddit + '<br>' +
                       '<strong>URL:</strong> ' + post.url + '<br>' +
                       '<button data-id=' + post.id + ' class="expand">Show Comments</button></li>');
    }

    function addKeyword(keyword) {
        $keywords.append('<li><strong>' + keyword + '</strong><br>' + '</li>');
    }

    // fetch & display all posts
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/db/',
        success: function(product) {
            // write retrieved keywords into HTML
            $.each(Object.keys(product), function(i, keyword) {
                addKeyword(keyword);
            });
        },
        error: function() {
            alert('error loading keywords');
        }
    });
});
