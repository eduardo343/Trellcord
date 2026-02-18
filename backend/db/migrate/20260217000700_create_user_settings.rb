class CreateUserSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :user_settings do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.boolean :email_notifications, null: false, default: true
      t.boolean :push_notifications, null: false, default: true
      t.boolean :board_updates, null: false, default: true
      t.boolean :mentions, null: false, default: true
      t.boolean :profile_visibility, null: false, default: true
      t.boolean :activity_visibility, null: false, default: false

      t.timestamps
    end
  end
end
