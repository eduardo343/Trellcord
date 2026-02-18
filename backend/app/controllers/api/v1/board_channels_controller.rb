module Api
  module V1
    class BoardChannelsController < ApplicationController
      before_action :authenticate_request
      before_action :set_board

      def index
        channels = @board.board_channels.order(:created_at)
        render json: channels.map { |channel| board_channel_payload(channel) }
      end

      def create
        channel = @board.board_channels.new(channel_params)

        if channel.save
          render json: board_channel_payload(channel), status: :created
        else
          render json: { errors: channel.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_board
        @board = current_user.accessible_boards.find(params[:board_id])
      end

      def channel_params
        source = params[:channel].present? ? params.require(:channel) : params
        source.permit(:name)
      end

      def board_channel_payload(channel)
        {
          id: channel.id.to_s,
          name: channel.name,
          boardId: channel.board_id.to_s,
          createdAt: channel.created_at.iso8601,
          updatedAt: channel.updated_at.iso8601
        }
      end
    end
  end
end
