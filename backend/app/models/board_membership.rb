class BoardMembership < ApplicationRecord
  ROLES = %w[owner admin member].freeze

  belongs_to :board
  belongs_to :user

  validates :role, inclusion: { in: ROLES }
  validates :user_id, uniqueness: { scope: :board_id }
end
