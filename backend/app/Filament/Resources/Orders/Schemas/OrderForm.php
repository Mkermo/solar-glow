<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('reference')
                    ->disabled()
                    ->dehydrated(false),
                Select::make('order_status_id')
                    ->label('Status')
                    ->relationship('status', 'name')
                    ->required(),
                TextInput::make('customer_name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('phone')
                    ->tel(),
                TextInput::make('address')
                    ->required(),
                TextInput::make('city')
                    ->required(),
                Textarea::make('notes')
                    ->columnSpanFull(),
                TextInput::make('subtotal')
                    ->disabled()
                    ->dehydrated(false)
                    ->numeric()
                    ->prefix('$'),
                TextInput::make('shipping')
                    ->disabled()
                    ->dehydrated(false)
                    ->numeric()
                    ->prefix('$'),
                TextInput::make('total')
                    ->disabled()
                    ->dehydrated(false)
                    ->numeric()
                    ->prefix('$'),
            ]);
    }
}
