class Collage < ApplicationRecord
  attr_accessor :collage_json, :image, :public_id
  belongs_to :user
end
