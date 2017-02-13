class CollagesController < ApplicationController
  include ActionView::Rendering

  before_action :authenticate_user!

  def index
    @collage = Collage.new
    @collages = Collage.where(user_id: current_user.id).order('created_at DESC')
  end

  def show
    @collage = Collage.find(params[:id])
    @photo = Photo.new
    @photos = Photo.where(user_id: current_user.id).order('created_at DESC')
  end

  def update
    @collage = Collage.find(params[:id])
    Cloudinary::Uploader.destroy(@collage[:public_id]) if @collage[:public_id]
    update_columns
  end

  def create
    @collage = Collage.new
    @collage.user_id = current_user.id
    @collage.save
    redirect_to @collage
  end

  def delete_preview
    p 'VASYA'
  end

  private

  def update_columns
    @collage.update_columns(
      image: collage_params[:image],
      collage_json: collage_params[:collage_json],
      public_id: collage_params[:public_id]
    )
  end

  def collage_params
    params.require(:collage).permit(:collage_json, :image, :public_id)
  end
end
