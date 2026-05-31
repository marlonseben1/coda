<?php

namespace App\Http\Requests;

use App\Enums\ContaBanco;
use App\Enums\ContaTipo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreContaRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $merge = [];

        if (is_numeric($this->tipo)) {
            $merge['tipo'] = (int) $this->tipo;
        }

        if (is_numeric($this->banco)) {
            $merge['banco'] = (int) $this->banco;
        }

        if ($merge) {
            $this->merge($merge);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'saldo_inicial' => ['required', 'numeric', 'min:0'],
            'tipo' => ['required', new Enum(ContaTipo::class)],
            'banco' => ['required', new Enum(ContaBanco::class)],
        ];
    }
}
