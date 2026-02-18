# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
demo_user = User.find_or_initialize_by(email: "alan@example.com")
demo_user.assign_attributes(
  name: "Alan Ugarte",
  password: "password123",
  password_confirmation: "password123",
  is_online: true
)
demo_user.save!

if demo_user.owned_boards.empty?
  board = demo_user.owned_boards.create!(
    title: "Marketing Campaign",
    description: "Plan and execute marketing campaigns",
    is_starred: true
  )
  board.board_memberships.create!(user: demo_user, role: "owner")
end
