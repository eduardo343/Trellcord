module Api
  module V1
    class SettingsController < ApplicationController
      before_action :authenticate_request

      def show
        unless settings_table_available?
          render json: default_settings_payload
          return
        end

        render json: settings_payload(current_user.user_setting || current_user.create_user_setting!)
      end

      def update
        unless settings_table_available?
          render json: { error: "Settings storage unavailable. Run db:migrate." }, status: :service_unavailable
          return
        end

        settings = current_user.user_setting || current_user.create_user_setting!

        if settings.update(settings_params)
          render json: settings_payload(settings)
        else
          render json: { errors: settings.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def settings_table_available?
        ActiveRecord::Base.connection.data_source_exists?("user_settings")
      rescue StandardError
        false
      end

      def settings_params
        source = params[:settings].present? ? params.require(:settings) : params
        source.permit(
          :email_notifications,
          :push_notifications,
          :board_updates,
          :mentions,
          :profile_visibility,
          :activity_visibility
        )
      end

      def settings_payload(settings)
        {
          userId: settings.user_id.to_s,
          emailNotifications: settings.email_notifications,
          pushNotifications: settings.push_notifications,
          boardUpdates: settings.board_updates,
          mentions: settings.mentions,
          profileVisibility: settings.profile_visibility,
          activityVisibility: settings.activity_visibility
        }
      end

      def default_settings_payload
        {
          userId: current_user.id.to_s,
          emailNotifications: true,
          pushNotifications: true,
          boardUpdates: true,
          mentions: true,
          profileVisibility: true,
          activityVisibility: false
        }
      end
    end
  end
end
