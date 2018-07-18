'use strict';

$(function() {
    let $keywords = $('#keywords');

    function addPost(post, $posts) {
        $posts.append('<li><strong>Title: </strong>' + post.title + '<br>' +
                      '<strong>Author: </strong>' + post.author + '<br>' +
                      '<strong>Score: </strong>' + post.score + '<br>' +
                      '<strong>Date: </strong>' + post.date + '<br>' +
                      '<strong>Subreddit: </strong>' + post.subreddit + '<br>' +
                      '<strong>URL: </strong>' + post.url + '<br>' +
                      '<button data-id=' + post.id + ' class="expand">Show Comments</button></li>');
    }

    function addKeyword(keyword, product) {
        $keywords.append('<li><strong>' + keyword + '</strong><br>' +
                         '<strong>Last Crawl Date: </strong>' + product[keyword]['timestamp'] + '<br>' +
                         '<strong>Subreddit: </strong> r/' + product[keyword]['subreddit'] + '<br>' +
                         '<button data-id="' + keyword + '" class="show-posts">Show Posts</button>' +
                         '<ul class="posts"></ul></li>');
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

    $keywords.on('click', '.show-posts', function() {
        let $posts = $(this).closest('li').find('.posts');
        let keyword = $(this).attr('data-id');

        $.ajax({
            type: 'GET',
            url: 'http://localhost:3000/' + keyword + '/',
            success: function(product) {
                $.each(product['posts'], function(i, post) {
                    addPost(post, $posts);
                });
            },
            error: function() {
                alert('error loading posts');
            }
        });
    });
});
