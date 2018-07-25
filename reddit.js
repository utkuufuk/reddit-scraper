'use strict';

$(function() {
    let postsHidden = {};
    let commentsHidden = {};
    let keywords = [];
    let $keywords = $('#keywords');

    function toggleButton($element, $button, name, flagId, flagMap)
    {
         $element.slideToggle(500, function() {
            if (flagMap[flagId]) {
                $button.html('Hide ' + name);
                flagMap[flagId] = false;
            }
            else {
                $button.html('Show ' + name);
                flagMap[flagId] = true;
            }
        });
    }

    function addComment(comment, id, postUrl, $comments) {
        $comments.append('<li><div class="hl"></div>' + 
                         '<b>ID: </b><a href="' + postUrl.replace('?sort=new', id) + '">' + id + '</a><br>' +
                         '<b>Author: </b>' + comment.author + '<br>' +
                         '<b>Date: </b>' + comment.date + '<br>' +
                         '<b>Score: </b>' + comment.score + '<br>' +
                         '<b>Number of Replies: </b>' + comment['num-replies'] + '<br>' +
                         '<b>Reply To: </b><a href="' + postUrl.replace('?sort=new', comment['reply-to']) + 
                         '">' + comment['reply-to'] + '</a><br><p>' + comment.text + '</p><hr></li>');
    }

    function addPost(post, $posts) {
        let postId = post.date.replace(/\s/g, "");
        let numComments = Object.keys(post['comments']).length;
        let commentRating = 0;
        let highestCommentRating = 0;
        let bestCommentId = "";

        Object.keys(post['comments']).forEach(function(key) {
            commentRating += post['comments'][key]['score'];
            if (post['comments'][key]['score'] > highestCommentRating) {
                highestCommentRating = post['comments'][key]['score'];
                bestCommentId = key;
            }
        });

        $posts.append('<li><a href="' + post.url + '">' + post.title + '</a><br>' +
                      '<b>Author: </b>' + post.author + '<br>' +
                      '<b>Score: </b>' + post.score + '<br>' +
                      '<b>Date: </b>' + post.date + '<br>' +
                      '<b>Subreddit: </b>' + post.subreddit + '<br>' +
                      '<b>Number of Comments: </b>' + numComments + '<br>' +
                      '<b>Average Comment Rating: </b>' + Math.round(commentRating / numComments) + '<br>' +
                      '<b>Highest Rated Comment ID: </b><a href="' + post.url.replace('?sort=new', bestCommentId) + 
                      '">' + bestCommentId + '</a><br>' +
                      '<button post-id=' + postId + ' class="toggle-comments">Show Comments</button>' +
                      '<ul class="comments"></ul><hr></li>');

        if (numComments == 0) {
            $("button[post-id='" + postId + "']").hide();
        }
    }

    function addKeyword(keyword, product) {
        let sub = product[keyword]['subreddit'];
        let postRating = 0;
        let highestPostRating = 0;
        let bestPostUrl = "";
        let bestPostTitle = "";

        for (let post of product[keyword]['posts']) {
            postRating += post['score'];
            if (post['score'] > highestPostRating) {
                highestPostRating = post['score'];
                bestPostUrl = post.url;
                bestPostTitle = post.title;
            }
        }
        $keywords.append('<li><b><i style="color:teal;font-size:20px;">' + keyword + '</i></b><br>' +
                         '<b>Subreddit: </b><a href=https://www.reddit.com/r/' + sub + '>r/' + sub + '</a><br>' +
                         '<b>Number of Posts: </b>' + product[keyword]['posts'].length + '<br>' +
                         '<b>Average Post Rating: </b>' + Math.round(postRating / product[keyword]['posts'].length) + '<br>' +
                         '<b>Highest Rated Post: </b><a href="' + bestPostUrl + '">' + bestPostTitle + '</a><br>' +
                         '<button keyword="' + keyword + '" class="toggle-posts">Show Posts</button>' +
                         '<ul class="posts"></ul><hr></li>');
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
        postsHidden[keyword] = true;
        $posts.hide();

        $.ajax({
            type: 'GET',
            url: 'http://localhost:3000/' + keyword + '/',
            success: function(product) {
                $.each(product['posts'], function(i, post) {
                    addPost(post, $posts);
                    let commentKeys = Object.keys(post['comments']);

                    for (let c = 0; c < commentKeys.length; c++) {
                        let $comments = $posts.find('.comments').eq(i);
                        $comments.hide();
                        commentsHidden[post.date.replace(/\s/g, "")] = true;
                        addComment(post['comments'][commentKeys[c]], commentKeys[c], post.url, $comments);
                    }
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
        let keyword = $(this).attr('keyword'); 
        toggleButton($posts, $button, "Posts", keyword, postsHidden)
    });

    $keywords.on('click', '.toggle-comments', function() {
        let $comments = $(this).closest('li').find('.comments');
        let $button = $(this).closest('li').find('.toggle-comments');
        let postId = $(this).attr('post-id'); 
        toggleButton($comments, $button, "Comments", postId, commentsHidden)
    });
});
