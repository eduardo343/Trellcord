class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  private

  def authenticate_request
    render_unauthorized and return unless current_user
  end

  def current_user
    return @current_user if defined?(@current_user)

    token = request.headers["Authorization"]&.split&.last
    payload = token ? JsonWebToken.decode(token) : nil
    @current_user = payload ? User.find_by(id: payload[:user_id]) : nil
  end

  def render_not_found(error)
    render json: { error: error.message }, status: :not_found
  end

  def render_unauthorized
    render json: { error: "Unauthorized" }, status: :unauthorized
  end
end
