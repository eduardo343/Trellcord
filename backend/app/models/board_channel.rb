class BoardChannel < ApplicationRecord
  belongs_to :board
  has_many :channel_messages, dependent: :destroy

  validates :name, presence: true, length: { maximum: 64 }, uniqueness: { scope: :board_id, case_sensitive: false }

  before_validation :normalize_name

  private

  def normalize_name
    self.name = name.to_s.strip.downcase
  end
end
