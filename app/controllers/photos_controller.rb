class PhotosController < ApplicationController
  before_action :authenticate_user!

  def index
    @photo = Photo.new
    @photos = Photo.where(user_id: current_user.id).order('created_at DESC')
  end

  def create
    @photo = Photo.create(photo_params)
    @photo.user_id = current_user.id
    render json: @photo if @photo.save
  end

  def destroy
    Photo.find(params[:id]).destroy
  end

  private

  def photo_params
    params.require(:photo).permit(:image)
  end
end
