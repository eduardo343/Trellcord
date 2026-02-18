module Api
  module V1
    class BaseController < ApplicationController
      def show
        render json: {
          status: "ok",
          service: "trellcord-api",
          version: "v1"
        }
      end
    end
  end
end
