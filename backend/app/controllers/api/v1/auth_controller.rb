module Api
  module V1
    class AuthController < ApplicationController
      before_action :authenticate_request, only: [:me, :update_me, :change_password]

      def register
        user = User.new(register_params)

        if user.save
          token = JsonWebToken.encode(user_id: user.id)
          render json: { token:, user: user_payload(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        email = login_params[:email].to_s.strip.downcase
        user = User.find_by(email:)

        if user&.authenticate(login_params[:password])
          token = JsonWebToken.encode(user_id: user.id)
          render json: { token:, user: user_payload(user) }
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def me
        render json: { user: user_payload(current_user) }
      end

      def update_me
        if current_user.update(profile_params)
          render json: { user: user_payload(current_user) }
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def change_password
        unless current_user.authenticate(password_params[:current_password].to_s)
          render json: { error: "Current password is incorrect" }, status: :unprocessable_entity
          return
        end

        if current_user.update(password: password_params[:new_password], password_confirmation: password_params[:new_password])
          render json: { message: "Password updated successfully" }
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def forgot_password
        email = forgot_password_params[:email].to_s.strip.downcase
        user = User.find_by(email:)
        # Return a generic success response to avoid email enumeration.
        response = { message: "If that email exists, we sent reset instructions." }

        if user
          token = JsonWebToken.encode({ user_id: user.id, purpose: "password_reset" }, expires_in: 30.minutes)
          if Rails.env.development?
            response[:resetToken] = token
            response[:resetUrl] = "#{ENV.fetch('FRONTEND_ORIGIN', 'http://localhost:3000')}/reset-password?token=#{token}"
          end
        end

        render json: response
      end

      def validate_reset_token
        payload = decode_password_reset_token(token_params[:token])
        if payload
          render json: { valid: true }
        else
          render json: { error: "Invalid or expired token" }, status: :unprocessable_entity
        end
      end

      def reset_password
        payload = decode_password_reset_token(reset_password_params[:token])
        unless payload
          render json: { error: "Invalid or expired token" }, status: :unprocessable_entity
          return
        end

        user = User.find_by(id: payload[:user_id])
        unless user
          render json: { error: "Invalid token user" }, status: :unprocessable_entity
          return
        end

        if user.update(password: reset_password_params[:new_password], password_confirmation: reset_password_params[:new_password])
          render json: { message: "Password reset successfully" }
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def register_params
        source = params[:user].present? ? params.require(:user) : params
        source.permit(:name, :email, :password, :password_confirmation)
      end

      def login_params
        source = params[:user].present? ? params.require(:user) : params
        source.permit(:email, :password)
      end

      def profile_params
        source = params[:user].present? ? params.require(:user) : params
        source.permit(:name, :email)
      end

      def password_params
        source = params[:user].present? ? params.require(:user) : params
        source.permit(:current_password, :new_password)
      end

      def forgot_password_params
        source = params[:user].present? ? params.require(:user) : params
        source.permit(:email)
      end

      def token_params
        source = params[:user].present? ? params.require(:user) : params
        source.permit(:token)
      end

      def reset_password_params
        source = params[:user].present? ? params.require(:user) : params
        source.permit(:token, :new_password)
      end

      def decode_password_reset_token(token)
        payload = JsonWebToken.decode(token.to_s)
        return nil unless payload
        return nil unless payload[:purpose] == "password_reset"

        payload
      end

      def user_payload(user)
        {
          id: user.id.to_s,
          name: user.name,
          email: user.email,
          avatar: user.avatar.to_s,
          isOnline: user.is_online
        }
      end
    end
  end
end
