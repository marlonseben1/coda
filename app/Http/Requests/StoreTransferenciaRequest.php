<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTransferenciaRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $merge = [];

        if (is_numeric($this->from_account_id)) {
            $merge['from_account_id'] = (int) $this->from_account_id;
        }

        if (is_numeric($this->to_account_id)) {
            $merge['to_account_id'] = (int) $this->to_account_id;
        }

        if (is_numeric($this->valor_transferencia)) {
            $merge['valor_transferencia'] = (float) $this->valor_transferencia;
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
            'from_account_id' => ['required', 'integer', 'exists:contas,id'],
            'to_account_id' => ['required', 'integer', 'exists:contas,id', 'different:from_account_id'],
            'valor_transferencia' => ['required', 'numeric', 'min:0.01'],
            'data_transferencia' => ['required', 'date'],
        ];
    }
}
