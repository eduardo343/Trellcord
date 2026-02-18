class User < ApplicationRecord
  has_secure_password

  has_many :owned_boards, class_name: "Board", foreign_key: :owner_id, dependent: :destroy
  has_many :board_memberships, dependent: :destroy
  has_many :boards, through: :board_memberships
  has_many :channel_messages, dependent: :destroy
  has_one :user_setting, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false }

  before_validation :normalize_email

  def accessible_boards
    Board.left_outer_joins(:board_memberships)
      .where("boards.owner_id = :user_id OR board_memberships.user_id = :user_id", user_id: id)
      .distinct
  end

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
