class AddInviteCodeToBoards < ActiveRecord::Migration[8.0]
  class MigrationBoard < ApplicationRecord
    self.table_name = "boards"
  end

  def up
    add_column :boards, :invite_code, :string
    add_index :boards, :invite_code, unique: true

    MigrationBoard.reset_column_information
    MigrationBoard.find_each do |board|
      board.update_columns(invite_code: generate_unique_code) # rubocop:disable Rails/SkipsModelValidations
    end

    change_column_null :boards, :invite_code, false
  end

  def down
    remove_index :boards, :invite_code
    remove_column :boards, :invite_code
  end

  private

  def generate_unique_code
    loop do
      code = SecureRandom.alphanumeric(8).upcase
      break code unless MigrationBoard.exists?(invite_code: code)
    end
  end
end
