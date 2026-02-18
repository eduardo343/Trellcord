class Board < ApplicationRecord
  before_validation :ensure_invite_code, on: :create
  after_create :create_default_channel!

  belongs_to :owner, class_name: "User"

  has_many :board_memberships, dependent: :destroy
  has_many :members, through: :board_memberships, source: :user
  has_many :board_channels, dependent: :destroy

  validates :title, presence: true
  validates :invite_code, presence: true, uniqueness: true
  validates :color, presence: true
  validates :team_name, presence: true
  validates :progress, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100, only_integer: true }

  scope :archived, -> { where.not(archived_at: nil) }
  scope :active, -> { where(archived_at: nil) }

  def archived?
    archived_at.present?
  end

  def archive!
    update!(archived_at: Time.current)
  end

  def restore!
    update!(archived_at: nil)
  end

  private

  def create_default_channel!
    return unless self.class.connection.data_source_exists?("board_channels")

    board_channels.find_or_create_by!(name: "general")
  end

  def ensure_invite_code
    return if invite_code.present?

    loop do
      candidate = SecureRandom.alphanumeric(8).upcase
      unless self.class.exists?(invite_code: candidate)
        self.invite_code = candidate
        break
      end
    end
  end
end
