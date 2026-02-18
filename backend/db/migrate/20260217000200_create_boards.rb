class CreateBoards < ActiveRecord::Migration[8.0]
  def change
    create_table :boards do |t|
      t.string :title, null: false
      t.text :description
      t.boolean :is_starred, null: false, default: false
      t.datetime :archived_at
      t.references :owner, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :boards, :archived_at
  end
end
