class JsonWebToken
  SECRET = ENV.fetch("JWT_SECRET", "dev_jwt_secret_change_me")

  # Accepts either a hash payload or keyword attributes (e.g. encode(user_id: 1)).
  def self.encode(payload = nil, expires_in: 24.hours, **attrs)
    payload_hash =
      if payload.nil?
        {}
      elsif payload.is_a?(Hash)
        payload
      else
        raise ArgumentError, "payload must be a Hash"
      end

    payload = payload_hash.merge(attrs).dup
    payload[:exp] = expires_in.from_now.to_i
    JWT.encode(payload, SECRET, "HS256")
  end

  def self.decode(token)
    body = JWT.decode(token, SECRET, true, { algorithm: "HS256" })[0]
    body.with_indifferent_access
  rescue JWT::DecodeError
    nil
  end
end
