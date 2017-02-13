class Photo < ApplicationRecord
  belongs_to :user

  mount_uploader :image, ImageUploader

  validates_presence_of :image
end
