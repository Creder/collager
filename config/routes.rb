Rails.application.routes.draw do
  root to: 'photos#index'

  devise_for :users
  devise_for :photos
  devise_for :collages

  resources :users
  resources :photos
  resources :collages
end
