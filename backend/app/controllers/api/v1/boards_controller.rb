module Api
  module V1
    class BoardsController < ApplicationController
      before_action :authenticate_request
      before_action :set_board, only: [:show, :update, :destroy]
      before_action :authorize_owner!, only: [:update, :destroy]

      def index
        boards = current_user.accessible_boards.includes(:members).order(updated_at: :desc)
        render json: boards.map { |board| board_payload(board) }
      end

      def show
        render json: board_payload(@board)
      end

      def create
        board = current_user.owned_boards.new(create_board_params)
        apply_archived_flag(board)

        if board.save
          board.board_memberships.create!(user: current_user, role: "owner")
          render json: board_payload(board), status: :created
        else
          render json: { errors: board.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def join
        invite_code = join_params[:invite_code].to_s.strip.upcase
        board = Board.find_by!(invite_code:)

        unless board.owner_id == current_user.id || board.members.exists?(current_user.id)
          board.board_memberships.create!(user: current_user, role: "member")
        end

        render json: board_payload(board), status: :created
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Board not found for that invite code" }, status: :not_found
      end

      def update
        @board.assign_attributes(update_board_params)
        apply_archived_flag(@board)

        if @board.save
          render json: board_payload(@board)
        else
          render json: { errors: @board.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @board.destroy!
        head :no_content
      end

      private

      def set_board
        @board = current_user.accessible_boards.find(params[:id])
      end

      def authorize_owner!
        return if @board.owner_id == current_user.id

        render json: { error: "Only the board owner can modify this board" }, status: :forbidden
      end

      def create_board_params
        source = params[:board].present? ? params.require(:board) : params
        source.permit(:title, :description, :is_starred, :color, :progress, :team_name)
      end

      def update_board_params
        source = params[:board].present? ? params.require(:board) : params
        source.permit(:title, :description, :is_starred, :color, :progress, :team_name)
      end

      def join_params
        source = params[:board].present? ? params.require(:board) : params
        source.permit(:invite_code)
      end

      def apply_archived_flag(board)
        source = params[:board].present? ? params[:board] : params
        return unless source.key?(:archived) || source.key?("archived")

        archived = ActiveModel::Type::Boolean.new.cast(source[:archived] || source["archived"])
        board.archived_at = archived ? Time.current : nil
      end

      def board_payload(board)
        {
          id: board.id.to_s,
          title: board.title,
          description: board.description.to_s,
          isStarred: board.is_starred,
          color: board.color,
          progress: board.progress,
          teamName: board.team_name,
          inviteCode: board.invite_code,
          archived: board.archived?,
          members: board.members.map do |member|
            {
              id: member.id.to_s,
              name: member.name,
              email: member.email,
              avatar: member.avatar.to_s,
              isOnline: member.is_online
            }
          end,
          lists: [],
          createdAt: board.created_at,
          updatedAt: board.updated_at
        }
      end
    end
  end
end
