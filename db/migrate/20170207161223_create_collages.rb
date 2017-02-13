class CreateCollages < ActiveRecord::Migration[5.0]
  def change
    create_table :collages do |t|
      t.belongs_to :user, index: true
      t.string :image
      t.string :public_id
      t.text :collage_json

      t.timestamps
    end
  end
end
