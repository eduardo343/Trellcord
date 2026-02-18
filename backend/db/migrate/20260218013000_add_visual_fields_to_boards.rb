class AddVisualFieldsToBoards < ActiveRecord::Migration[8.0]
  def change
    add_column :boards, :color, :string, null: false, default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    add_column :boards, :progress, :integer, null: false, default: 0
    add_column :boards, :team_name, :string, null: false, default: "General"

    add_index :boards, :team_name
    add_check_constraint :boards, "progress >= 0 AND progress <= 100", name: "boards_progress_between_0_and_100"
  end
end
