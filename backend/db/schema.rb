# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_02_18_013000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "board_channels", force: :cascade do |t|
    t.bigint "board_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["board_id", "name"], name: "index_board_channels_on_board_id_and_name", unique: true
    t.index ["board_id"], name: "index_board_channels_on_board_id"
  end

  create_table "board_memberships", force: :cascade do |t|
    t.bigint "board_id", null: false
    t.bigint "user_id", null: false
    t.string "role", default: "member", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["board_id", "user_id"], name: "index_board_memberships_on_board_id_and_user_id", unique: true
    t.index ["board_id"], name: "index_board_memberships_on_board_id"
    t.index ["user_id"], name: "index_board_memberships_on_user_id"
  end

  create_table "boards", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.boolean "is_starred", default: false, null: false
    t.datetime "archived_at"
    t.bigint "owner_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "invite_code", null: false
    t.string "color", default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", null: false
    t.integer "progress", default: 0, null: false
    t.string "team_name", default: "General", null: false
    t.index ["archived_at"], name: "index_boards_on_archived_at"
    t.index ["invite_code"], name: "index_boards_on_invite_code", unique: true
    t.index ["owner_id"], name: "index_boards_on_owner_id"
    t.index ["team_name"], name: "index_boards_on_team_name"
    t.check_constraint "progress >= 0 AND progress <= 100", name: "boards_progress_between_0_and_100"
  end

  create_table "channel_messages", force: :cascade do |t|
    t.bigint "board_channel_id", null: false
    t.bigint "user_id", null: false
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["board_channel_id", "created_at"], name: "index_channel_messages_on_board_channel_id_and_created_at"
    t.index ["board_channel_id"], name: "index_channel_messages_on_board_channel_id"
    t.index ["user_id"], name: "index_channel_messages_on_user_id"
  end

  create_table "user_settings", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.boolean "email_notifications", default: true, null: false
    t.boolean "push_notifications", default: true, null: false
    t.boolean "board_updates", default: true, null: false
    t.boolean "mentions", default: true, null: false
    t.boolean "profile_visibility", default: true, null: false
    t.boolean "activity_visibility", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_settings_on_user_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "avatar"
    t.boolean "is_online", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "board_channels", "boards"
  add_foreign_key "board_memberships", "boards"
  add_foreign_key "board_memberships", "users"
  add_foreign_key "boards", "users", column: "owner_id"
  add_foreign_key "channel_messages", "board_channels"
  add_foreign_key "channel_messages", "users"
  add_foreign_key "user_settings", "users"
end
