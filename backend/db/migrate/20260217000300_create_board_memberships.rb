class CreateBoardMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :board_memberships do |t|
      t.references :board, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :role, null: false, default: "member"

      t.timestamps
    end

    add_index :board_memberships, [:board_id, :user_id], unique: true
  end
end
