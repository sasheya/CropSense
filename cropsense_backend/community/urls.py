from django.urls import path
from .views import (
    PostListCreateView,
    PostDetailView,
    UserPostsView,
    MyPostsView,
    CommentListCreateView,
    CommentDetailView,
    MyCommentsView,
    CommunityStatisticsView,
    SearchPostsView
)

urlpatterns = [
    # Posts
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/my/', MyPostsView.as_view(), name='my-posts'),
    path('posts/user/<str:username>/', UserPostsView.as_view(), name='user-posts'),
    path('posts/search/', SearchPostsView.as_view(), name='search-posts'),
    
    # Comments
    path('posts/<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('comments/my/', MyCommentsView.as_view(), name='my-comments'),
    
    # Statistics
    path('statistics/', CommunityStatisticsView.as_view(), name='community-statistics'),
]