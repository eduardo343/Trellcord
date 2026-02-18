Rails.application.routes.draw do
  mount ActionCable.server => "/cable"

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
  namespace :api do
    namespace :v1 do
      get "/", to: "base#show"

      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      get "auth/me", to: "auth#me"
      patch "auth/me", to: "auth#update_me"
      patch "auth/password", to: "auth#change_password"
      post "auth/forgot-password", to: "auth#forgot_password"
      post "auth/validate-reset-token", to: "auth#validate_reset_token"
      post "auth/reset-password", to: "auth#reset_password"

      get "settings", to: "settings#show"
      patch "settings", to: "settings#update"

      resources :boards, only: [:index, :show, :create, :update, :destroy] do
        collection do
          post :join
        end

        resources :channels, controller: "board_channels", only: [:index, :create] do
          resources :messages, controller: "channel_messages", only: [:index, :create]
        end
      end
    end
  end
end
