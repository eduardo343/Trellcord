class CreateChannelMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :channel_messages do |t|
      t.references :board_channel, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :content, null: false

      t.timestamps
    end

    add_index :channel_messages, [:board_channel_id, :created_at]
  end
end
