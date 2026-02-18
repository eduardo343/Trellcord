class CreateBoardChannels < ActiveRecord::Migration[8.0]
  class MigrationBoard < ApplicationRecord
    self.table_name = "boards"
  end

  class MigrationBoardChannel < ApplicationRecord
    self.table_name = "board_channels"
  end

  def up
    create_table :board_channels do |t|
      t.references :board, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end

    add_index :board_channels, [:board_id, :name], unique: true

    MigrationBoard.reset_column_information
    MigrationBoardChannel.reset_column_information
    MigrationBoard.find_each do |board|
      MigrationBoardChannel.create!(
        board_id: board.id,
        name: "general",
        created_at: Time.current,
        updated_at: Time.current
      )
    end
  end

  def down
    remove_index :board_channels, [:board_id, :name]
    drop_table :board_channels
  end
end
