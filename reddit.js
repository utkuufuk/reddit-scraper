'use strict';

$(function() {
    let postsHidden = false;
    let keywords = [];
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
                         '<button keyword="' + keyword + '" class="toggle-posts">Show Posts</button>' +
                         '<ul class="posts"></ul></li>');
    }

    $.ajax({
        type: 'GET',
        async: false,
        url: 'http://localhost:3000/db/',
        success: function(product) {
            $.each(Object.keys(product), function(i, keyword) {
                addKeyword(keyword, product);
                keywords[i] = keyword;
            });
        },
        error: function() {
            alert('error loading keywords');
        }
    });

    for (let k = 0; k < keywords.length; k++) {
        let $posts = $('.posts').eq(k);
        let keyword = keywords[k];
        $posts.hide();

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
    }

    $keywords.on('click', '.toggle-posts', function() {
        let $posts = $(this).closest('li').find('.posts');
        let $button = $(this).closest('li').find('.toggle-posts');
        $posts.slideToggle(500, function() {
            if (postsHidden) {
                $button.html('Show Posts');
                postsHidden = false;
            }
            else {
                $button.html('Hide Posts');
                postsHidden = true;
            }
        });
    });
});
