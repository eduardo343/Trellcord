class BoardChatChannel < ApplicationCable::Channel
  def subscribed
    board_channel = BoardChannel.find_by(id: params[:board_channel_id])
    reject unless board_channel
    reject unless can_access_channel?(board_channel)

    stream_for board_channel
  end

  private

  def can_access_channel?(board_channel)
    board = board_channel.board
    board.owner_id == current_user.id || board.members.exists?(current_user.id)
  end
end
