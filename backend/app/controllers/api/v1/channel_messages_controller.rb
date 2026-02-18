module Api
  module V1
    class ChannelMessagesController < ApplicationController
      before_action :authenticate_request
      before_action :set_board
      before_action :set_channel

      def index
        limit = [params[:limit].to_i, 100].min
        limit = 50 if limit <= 0

        messages = @channel.channel_messages.includes(:user).order(created_at: :desc).limit(limit)

        if params[:before_id].present?
          before_message = @channel.channel_messages.find_by(id: params[:before_id])
          messages = messages.where("channel_messages.id < ?", before_message.id) if before_message
        end

        messages = messages.to_a.reverse
        render json: messages.map(&:as_chat_payload)
      end

      def create
        message = @channel.channel_messages.new(message_params)
        message.user = current_user

        if message.save
          render json: message.as_chat_payload, status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_board
        @board = current_user.accessible_boards.find(params[:board_id])
      end

      def set_channel
        @channel = @board.board_channels.find(params[:channel_id])
      end

      def message_params
        source = params[:message].present? ? params.require(:message) : params
        source.permit(:content)
      end
    end
  end
end
