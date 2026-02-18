class ChannelMessage < ApplicationRecord
  belongs_to :board_channel
  belongs_to :user

  validates :content, presence: true, length: { maximum: 4000 }

  after_create_commit :broadcast_created_message

  def as_chat_payload
    {
      id: id.to_s,
      content: content,
      channelId: board_channel_id.to_s,
      createdAt: created_at.iso8601,
      author: {
        id: user.id.to_s,
        name: user.name,
        email: user.email,
        avatar: user.avatar.to_s,
        isOnline: user.is_online
      }
    }
  end

  private

  def broadcast_created_message
    BoardChatChannel.broadcast_to(board_channel, {
      type: "message_created",
      message: as_chat_payload
    })
  end
end
