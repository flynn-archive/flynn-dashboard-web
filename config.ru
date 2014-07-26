require 'bundler'
Bundler.require

require './config'

require 'static-sprockets/app'
map '/' do
  run StaticSprockets::App.new
end
